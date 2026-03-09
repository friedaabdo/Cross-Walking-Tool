import './confirmationArea.css'

function ConfirmationArea({pageName, lines}) {
    return (
        <div id = "confirmation-area">
            <h1>Confirm {pageName} Outcomes</h1>
            {lines.map((line, index) => (
                <p key={`${line}-${index}`}>{line}</p>
            ))}
        </div>
    )
}
export default ConfirmationArea