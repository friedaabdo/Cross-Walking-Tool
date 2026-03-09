import './Outcome-card.css'

function OutcomeCard({lines}) {
    return (
        <>
       {lines.map((line, index) => (
                <p key={`${line}-${index}`}>{line}</p>
            ))}
        </>
    )
}

export default OutcomeCard