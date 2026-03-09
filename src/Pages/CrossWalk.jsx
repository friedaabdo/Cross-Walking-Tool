import OutcomeCard from "../Components/Outcome-card"

function CrossWalk({certLines, syllLines}) {
    return (
        <div>
            <h2>Certificate Outcomes</h2>
           
                <OutcomeCard lines={certLines} />
          

            <h2>Syllabus Outcomes</h2>
                <OutcomeCard lines={syllLines} />
        </div>
    )
}
export default CrossWalk