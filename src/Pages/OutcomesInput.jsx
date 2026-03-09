// create a react page with a text box input and submit button.
import { useRef, useState } from 'react'
import './OutcomesInput.css'
import CertTextarea from '../Components/textarea'
import ConfirmCertInfo from '../Components/confirmationArea'
import Submit from '../Components/button'
import ConfirmCert from '../Components/button'
import { useNavigate } from 'react-router-dom'

function OutcomesInput({pageName}) {
    const [lines, setLines] = useState([])
    const textareaRef = useRef(null)

    const handleSubmit = () => {
        const value = textareaRef.current?.value ?? ''
        const submittedLines = value
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line !== '')
        setLines(submittedLines)
    }


    const navigate = useNavigate()
    const navigateToSyllabus = () => {
        navigate('/syllabus')
    }

    return (
        <div id = "outcomes-div">
            <h1>{pageName} Outcomes Input</h1>
            <CertTextarea pageName={pageName} textareaRef={textareaRef} />
            <Submit onClick={handleSubmit} text="Submit" />
            <ConfirmCertInfo pageName={pageName} lines={lines} />
            <ConfirmCert onClick={navigateToSyllabus} text="Confirm Certification Outcomes" />
        </div>
    )
}

export default OutcomesInput