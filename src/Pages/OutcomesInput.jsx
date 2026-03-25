// create a react page with a text box input and submit button.
import { useRef, useState } from 'react'
import './OutcomesInput.css'
import CertTextarea from '../Components/textarea'
import ConfirmCertInfo from '../Components/confirmationArea'
import Button from '../Components/button'
import SyllTextArea from '../Components/textarea'
import ConfirmSyllInfo from '../Components/confirmationArea'
import { useNavigate } from 'react-router-dom'

function OutcomesInput({
    pageName,
    certLines,
    setCertLines,
    syllLines,
    setSyllLines,
    leTitle,
    ccTitle,
}) {
    const isCertificatePage = pageName.toLowerCase() === 'learning experience'
    const [hasSubmitted, setHasSubmitted] = useState(false)
    const textareaCertRef = useRef(null)
    const textareaSyllRef = useRef(null)

    const title = isCertificatePage ? leTitle : ccTitle
    const lines = isCertificatePage ? certLines : syllLines
    const setLines = isCertificatePage ? setCertLines : setSyllLines
    const textareaRef = isCertificatePage ? textareaCertRef : textareaSyllRef
    const ConfirmInfo = isCertificatePage ? ConfirmCertInfo : ConfirmSyllInfo
    const TextareaComponent = isCertificatePage ? CertTextarea : SyllTextArea

    const handleSubmit = (textareaRef, setLines) => {
        const value = textareaRef.current?.value ?? ''
        const submittedLines = value
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line !== '')
        setLines(submittedLines)
        setHasSubmitted(true)
    }


    const navigate = useNavigate()
    const navigateToSyllabus = () => {
        navigate('/syllabus')
    }
    const navigateToCrosswalk = () => {
        navigate('/crosswalk')
    }

    const handleConfirmNavigation = () => {
        if (isCertificatePage) {
            navigateToSyllabus()
            return
        }

        navigateToCrosswalk()
    }

    return (
        <div id = "outcomes-div">

            <div className="outcomes-layout">
                <section className="outcomes-input-panel">
            <h1>{title} Outcomes Input</h1>
                    <TextareaComponent pageName={pageName} textareaRef={textareaRef} />
                    <Button onClick={() => handleSubmit(textareaRef, setLines)} text="Submit" />
                </section>

                {hasSubmitted && (
                    <section className="outcomes-confirmation-panel">
                        <ConfirmInfo pageName={pageName} title={title} lines={lines} />
                        <Button onClick={handleConfirmNavigation} text={`Confirm ${title} Outcomes`} />
                    </section>
                )}
            </div>
        </div>
    )
}

export default OutcomesInput