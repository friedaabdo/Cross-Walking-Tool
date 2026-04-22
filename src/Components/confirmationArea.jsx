import './confirmationArea.css'
import OutcomeCard from './Outcome-card'

function ConfirmationArea({ lines, title}) {
    return (
        <div id = "confirmation-area">
            <h1>Confirm {title} Outcomes</h1>
            <OutcomeCard lines={lines} showTopRightPlusIcon={true} />
        </div>
    )
}
export default ConfirmationArea