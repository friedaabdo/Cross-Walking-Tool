import './inputLine.css';

function InputLine({ value, onChange, placeholder, type = '', accept }) {

    const shouldUseValueProp = type !== 'file';

    return (
        <div className="input-line">
            <input
                type={type}
                value={shouldUseValueProp ? value : undefined}
                onChange={onChange}
                placeholder={placeholder}
                accept={accept}
                />
        </div>
    );
}

export default InputLine;