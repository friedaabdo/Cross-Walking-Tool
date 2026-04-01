import "./button.css"

function Button({onClick, text, type = "button", disabled = false}) {
    return (
        <button type={type} onClick={onClick} disabled={disabled}>{text}</button>
    )
}
export default Button