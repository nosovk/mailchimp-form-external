import React, { useEffect, useState, useRef } from 'react';
import './Select.css';

const Select = ({ options, onOptionSelected, onTagDeleted, selectedOptions }) => {
    const [ isOpen, setOpen ] = useState(false);
    const divSelectRef = useRef(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        window.addEventListener('click', (e) => {
            if (e.target !== divSelectRef.current && e.target !== dropdownRef.current) {
                setOpen(false);
            }
        });
    }, [  ]);

    return (
        <div className="custom-select-container">
            <div 
                className="custom-select"
                onClick={() => setOpen((state) => !state)}
                ref={divSelectRef}
            >
                {
                    selectedOptions.length > 0 
                    ? (
                        selectedOptions.map((option) => (
                            <span key={option.id} className="selected-option">
                                <span>{ option.name } </span>
                                <button className="selected-option__button" onClick={() => {onTagDeleted(option)}}>&#10006;</button>
                            </span>
                        ))
                    ) 
                    : 'Выберите тег'
                }
            </div>
            {
                isOpen ?
                (
                    <div className="custom-select__dropdown" ref={dropdownRef}>
                        {
                            options.length > 0 ? 
                            options.map((option) => {
                                return (
                                    <p 
                                        className="custom-select__dropdown-option" 
                                        key={option.id}
                                        onClick={() => onOptionSelected(option)}
                                    >{ option.name }</p>
                                );
                            }) : <p style={{textAlign: 'center', color: '#5d5d5d'}}>Нету тэгов</p>
                        }
                    </div>
    
                ) : null
            }
        </div>
    )
};

export default Select;
