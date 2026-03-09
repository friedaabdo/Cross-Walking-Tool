// create a react page with a text box input and submit button.
import { useState } from 'react'
import './OutcomesInput.css'
import CertTextarea from '../Components/textarea'
import ConfirmCertInfo from '../Components/confirmationArea'

function OutcomesInput({pageName}) {
    const [draftLines, setDraftLines] = useState([])
    const [lines, setLines] = useState([])

    const handleSubmit = () => {
        setLines(draftLines)
    }

    return (
        <div id = "outcomes-div">
            <h1>{pageName} Outcomes Input</h1>
            <CertTextarea pageName={pageName} onLinesChange={setDraftLines} />
            <button onClick={handleSubmit}>Submit</button>
            <ConfirmCertInfo pageName={pageName} lines={lines} />
        </div>
    )
}

export default OutcomesInput