// create a react page with a text box input and submit button.
import './OutcomesInput.css'
import CertTextarea from '../Components/textarea'

function OutcomesInput({pageName}) {
    return (
        <div id = "outcomes-div">
            <h1>{pageName} Outcomes Input</h1>
            <CertTextarea pageName={pageName}/>
            <button>Submit</button>
        </div>
    )
}

export default OutcomesInput