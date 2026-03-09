import './textarea.css'
function Textarea({pageName, textareaRef}) {
    return (
        <div>
            <textarea
                ref={textareaRef}
                placeholder={`Enter ${pageName} info. Each field on a new line.`}
            />
        </div>
    )
}
export default Textarea