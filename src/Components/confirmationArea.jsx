import './confirmationArea.css'
import OutcomeCard from './Outcome-card'

function ConfirmationArea({ lines,  outcomeLinks, setOutcomeLinks }) {
    return (
        <div id = "confirmation-area">
            <h3>How does everything look?</h3>
            <OutcomeCard
                lines={lines}
                showTopRightPlusIcon={true}
                outcomeLinks={outcomeLinks}
                setOutcomeLinks={setOutcomeLinks}
            />
        </div>
    )
}
export default ConfirmationArea