import './inputLine.css';

function InputLine({input,placeholder,type}) {

    return (
        <div className="input-line">
            <input
                type={type}
                value={input}
                placeholder={placeholder}
                />
        </div>
    );
}

export default InputLine;