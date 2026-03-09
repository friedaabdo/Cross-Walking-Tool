// create a react page with a text box input and submit button.
import { useRef, useState } from 'react'
import './OutcomesInput.css'
import CertTextarea from '../Components/textarea'
import ConfirmCertInfo from '../Components/confirmationArea'
import Button from '../Components/button'
import SyllTextArea from '../Components/textarea'
import ConfirmSyllInfo from '../Components/confirmationArea'
import { useNavigate } from 'react-router-dom'

function OutcomesInput({pageName}) {
    const isCertificatePage = pageName.toLowerCase() === 'certificate'

    const [certLines, setCertLines] = useState([])
    const [syllLines, setSyllLines] = useState([])
    const textareaCertRef = useRef(null)
    const textareaSyllRef = useRef(null)

    const handleSubmit = (textareaRef, setLines) => {
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
    const navigateToDND = () => {
        navigate('/crosswalk')
    }

    return (
        <div id = "outcomes-div">
            <h1>{pageName} Outcomes Input</h1>
            {isCertificatePage && (
                <>
                    <CertTextarea pageName={pageName} textareaRef={textareaCertRef} />
                    <Button onClick={() => handleSubmit(textareaCertRef, setCertLines)} text="Submit" />
                    <ConfirmCertInfo pageName={pageName} lines={certLines} />
                    <Button onClick={navigateToSyllabus} text="Confirm Certification Outcomes" />
                </>
            )}

            {!isCertificatePage && (
                <>
                    <SyllTextArea pageName={pageName} textareaRef={textareaSyllRef} />
                    <Button onClick={() => handleSubmit(textareaSyllRef, setSyllLines)} text="Submit" />
                    <ConfirmSyllInfo pageName={pageName} lines={syllLines} />
                    <Button onClick={navigateToDND} text="Confirm Syllabus Outcomes" />
                </>
            )}
        </div>
    )
}

export default OutcomesInput