import React from 'react';

function CheckboxInput({ id, label, checked, onChange }){
    return (
        <div className="check">
            <input
                type="checkbox"
                id={id}
                checked={checked}
                onChange={onChange}
            />
            <label htmlFor={id}>{label}</label>
        </div>
    );
};

export default CheckboxInput;
