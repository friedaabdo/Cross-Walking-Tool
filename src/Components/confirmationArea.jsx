import './confirmationArea.css'
import OutcomeCard from './Outcome-card'

function ConfirmationArea({pageName, lines}) {
    return (
        <div id = "confirmation-area">
            <h1>Confirm {pageName} Outcomes</h1>
            <OutcomeCard lines={lines} />
        </div>
    )
}
export default ConfirmationArea