import './inputLine.css';

function InputLine({ value, onChange, placeholder, type = '' }) {

    return (
        <div className="input-line">
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                />
        </div>
    );
}

export default InputLine;