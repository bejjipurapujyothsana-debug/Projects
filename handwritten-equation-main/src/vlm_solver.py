import os
import google.generativeai as genai
from sympy import Eq, solve, sympify
from sympy.parsing.sympy_parser import parse_expr, standard_transformations, implicit_multiplication_application
from PIL import Image
from src.config import GEMINI_API_KEY

# Configure Gemini
if not GEMINI_API_KEY:
    import logging
    logging.warning("GEMINI_API_KEY not found in environment variables. Please check your .env file.")
else:
    genai.configure(api_key=GEMINI_API_KEY)

def extract_equation_with_vlm(image_path, api_key=None):
    """
    Uses Gemini 1.5/2.0 to extract a handwritten quadratic equation from an image.
    """
    # Use provided API key or fallback to config/env
    if api_key:
        target_api_key = api_key.strip()
    elif GEMINI_API_KEY and GEMINI_API_KEY != "your_api_key_here":
        target_api_key = GEMINI_API_KEY.strip()
    else:
        target_api_key = None
        
    if not target_api_key or target_api_key == "your_api_key_here":
        raise ValueError("GEMINI_API_KEY is missing or invalid. Please paste your valid AIza... key in the UI field.")
        
    # Configure Gemini with the specific key for this request
    genai.configure(api_key=target_api_key)
    
    # Initialize the model using the standard name
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    # Load the image
    img = Image.open(image_path)
    
    # Prompt for equation Extraction
    prompt = (
        "Analyze this image of a handwritten quadratic equation. "
        "Extract the equation and provide it in a clean format that can be parsed by Python's SymPy library. "
        "For example, '2x^2 + 7x + 3 = 0' should be returned as '2*x**2 + 7*x + 3 = 0'. "
        "Return ONLY the equation string, no other text or explanation."
    )
    
    response = model.generate_content([prompt, img])
    
    if not response.text:
        raise ValueError("VLM failed to return a response.")
        
    equation_str = response.text.strip()
    # Basic cleanup in case Gemini adds markdown or extra spaces
    equation_str = equation_str.replace("`", "").replace("latex", "").strip()
    
    return equation_str

def solve_equation(equation_str):
    """
    Solves the extracted equation string using SymPy.
    """
    print(f"\nAttempting to solve: {equation_str}")
    
    try:
        if "=" in equation_str:
            left_side, right_side = equation_str.split("=", 1)
        else:
            left_side = equation_str
            right_side = "0"
            
        transformations = (standard_transformations + (implicit_multiplication_application,))
        
        lhs_expr = parse_expr(left_side, transformations=transformations)
        rhs_expr = parse_expr(right_side, transformations=transformations)
        
        equation = Eq(lhs_expr, rhs_expr)
        
        variables = equation.free_symbols
        if not variables:
             return "Could not find any variables to solve for."
             
        var = list(variables)[0]
        roots = solve(equation, var)
        
        nature_str = ""
        try:
            from sympy import Poly
            # Attempt to create a polynomial from the equation
            poly_eq = Poly(lhs_expr - rhs_expr, var)
            if poly_eq.degree() == 2:
                # Calculate discriminant manually for a standard quadratic ax^2 + bx + c = 0
                coeffs = poly_eq.all_coeffs()
                a, b, c = coeffs[0], coeffs[1], coeffs[2]
                discriminant = b**2 - 4*a*c
                if discriminant > 0:
                    nature_str = "\nNature of roots: Real and distinct roots"
                elif discriminant == 0:
                    nature_str = "\nNature of roots: Real and equal roots"
                elif discriminant < 0:
                    nature_str = "\nNature of roots: Complex/Imaginary roots"
            else:
                nature_str = f"\nNature of roots: N/A (Equation is degree {poly_eq.degree()})"
        except Exception:
            # Fallback if Poly parsing fails (e.g. non-polynomial expressions)
            pass
            
        return f"Roots for {var}: {roots}{nature_str}"
        
    except Exception as e:
        return f"Error solving equation. Detected: '{equation_str}'.\nDetails: {str(e)}"

def main_vlm_solver_pipeline(image_path, api_key=None):
    """
    The main pipeline using VLM for extraction and SymPy for solving.
    """
    print(f"Loading equation image with VLM: {image_path}")
    
    try:
        equation_string = extract_equation_with_vlm(image_path, api_key=api_key)
        print(f"Constructed string from VLM: {equation_string}")
    except Exception as e:
        print(f"Error predicting with VLM: {e}")
        return "Failed to extract text using Vision Language Model (Gemini).", str(e)
    
    solution = solve_equation(equation_string)
    print(f"\nFinal Solution:\n{solution}")
    
    return equation_string, solution

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python -m src.vlm_solver <path_to_image>")
        sys.exit(1)
        
    test_image_path = sys.argv[1]
    main_vlm_solver_pipeline(test_image_path)
