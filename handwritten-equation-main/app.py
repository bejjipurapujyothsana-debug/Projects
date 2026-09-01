import gradio as gr
import os
from src.vlm_solver import main_vlm_solver_pipeline

def solve_equation_ui(image_path):
    """
    Gradio wrapper for VLM solver.
    """
    if not image_path:
        return "⚠️ No Image Provided", "Please upload an image of an equation."
        
    try:
        # Call the VLM-based solver - API key is managed by environment variable
        equation_str, solution_str = main_vlm_solver_pipeline(image_path)
        return f"```python\n{equation_str}\n```", solution_str
    except Exception as e:
        return "❌ Error", f"An error occurred: {str(e)}"

# A modern, beautiful, soft theme
custom_theme = gr.themes.Soft(
    primary_hue="indigo", 
    secondary_hue="blue",
    neutral_hue="slate",
).set(
    button_primary_background_fill="*primary_500",
    button_primary_background_fill_hover="*primary_600",
    button_primary_text_color="white",
    button_primary_shadow="*shadow_drop_lg",
    block_title_text_weight="600",
    block_border_width="0px",
    block_shadow="*shadow_drop_lg",
    panel_border_color="*neutral_100",
    panel_background_fill="*neutral_50"
)

css = """
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
.gradio-container {
    font-family: 'Inter', sans-serif !important;
}
.header-text {
    text-align: center;
    background: linear-gradient(90deg, #4f46e5, #3b82f6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 800;
    margin-bottom: 0.5rem;
    font-size: 2.5rem;
}
.sub-text {
    text-align: center;
    color: #64748b;
    font-size: 1.1rem;
    margin-bottom: 2rem;
}
.gradio-button.primary {
    background: linear-gradient(90deg, #4f46e5, #3b82f6) !important;
    border: none !important;
}
.gradio-button.primary:hover {
    background: linear-gradient(90deg, #4338ca, #2563eb) !important;
}
@media (max-width: 600px) {
    .header-text {
        font-size: 1.8rem;
    }
    .sub-text {
        font-size: 0.9rem;
    }
}
"""

with gr.Blocks(title="AI Equation Solver") as demo:
    gr.HTML(
        '''
        <h1 class="header-text">✨ Hand-Written Equation Solver ✨</h1>
        <p class="sub-text">Upload an image of a handwritten quadratic equation and watch AI solve it instantly.</p>
        '''
    )
    
    with gr.Row():
        with gr.Column(scale=1, min_width=300):
            gr.Markdown("### 📸 Upload Image")
            image_input = gr.Image(type="filepath", label="Handwritten Equation Image")
            
            with gr.Row():
                clear_btn = gr.ClearButton([image_input])
                submit_btn = gr.Button("✨ Solve Equation ✨", variant="primary", scale=2)
            
        with gr.Column(scale=1, min_width=300):
            gr.Markdown("### 📊 AI Results")
            eq_output = gr.Markdown(label="Detected Equation String")
            sol_output = gr.Textbox(label="Computed Solution", lines=7)

    # Actions
    submit_btn.click(
        fn=solve_equation_ui, 
        inputs=[image_input], 
        outputs=[eq_output, sol_output]
    )

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    demo.launch(server_name="0.0.0.0", server_port=port, share=False, theme=custom_theme, css=css)
