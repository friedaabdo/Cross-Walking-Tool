import './textarea.css'
function Textarea({pageName, textareaRef}) {
    return (
        <>
            <textarea
                ref={textareaRef}
                placeholder={`Enter ${pageName} info. Each field on a new line.`}
            />
        </>
    )
}
export default Textarea