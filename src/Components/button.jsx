import "./button.css"

function Button({ onClick, text, type = "button", disabled = false, className = "" }) {
    return (
        <button type={type} onClick={onClick} disabled={disabled} className={className}>{text}</button>
    )
}
export default Button