import "./button.css"

function Button({onClick, text, type = "button"}) {
    return (
        <button type={type} onClick={onClick}>{text}</button>
    )
}
export default Button