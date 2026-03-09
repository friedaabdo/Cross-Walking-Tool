import './textarea.css'
function Textarea({pageName}) {
    
    // const handleTextAreaInput = (e) => {
    //     const textarea = e.target;
    //     const lines = textarea.value.split('\n');
    //    // between each line of input, add a <br> tag in between.
       

    // };

    return (
        <div>
            { <textarea placeholder={`Enter ${pageName} info. Each field on a new line.`} /*onInput={handleTextAreaInput}*/ /> }
        </div>
    )
}
export default Textarea