import "./Input.css";

function Input({
    type = "text",
    placeholder,
    value,
    onChange
}){

    return(
        <input
            className="input"
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
        />
    );
}

export default Input;
