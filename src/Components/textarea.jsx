import './textarea.css'
function Textarea({pageName, onLinesChange}) {
    
    const handleTextAreaInput = (e) => {
        const textarea = e.target;
        const lines = textarea.value
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line !== '');
        onLinesChange(lines);

    };

    return (
        <div>
            { <textarea placeholder={`Enter ${pageName} info. Each field on a new line.`} onInput={handleTextAreaInput} /> }
        </div>
    )
}
export default Textarea