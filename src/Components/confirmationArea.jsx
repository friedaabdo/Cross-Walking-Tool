import './confirmationArea.css'
import OutcomeCard from './Outcome-card'

function ConfirmationArea({ lines, sections, outcomeLinks, setOutcomeLinks }) {
    return (
        <div id = "confirmation-area">
            <h3>How does everything look?</h3>
            <OutcomeCard
                lines={lines}
                sections={sections}
                showTopRightPlusIcon={true}
                outcomeLinks={outcomeLinks}
                setOutcomeLinks={setOutcomeLinks}
            />
        </div>
    )
}
export default ConfirmationArea