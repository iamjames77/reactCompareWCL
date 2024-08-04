import React, { useState, useEffect} from 'react';
import './dropdown.css';

function Dropdown({name, options, onSelectValue, getIcon, isChange, initialOption}) {
    const [value, setValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [reset, setReset] = useState(!isChange);

    useEffect(() => {
        setReset(!isChange);
    }, [isChange]);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleOptionClick = (option) => {
        setValue(option.value);
        onSelectValue(option.value);
        setSelectedOption(option);
        setIsOpen(false);
    };

    return (
        <div className="dropdown">
            <div className="dropdown-header" onClick={handleToggle}>
                {selectedOption && reset? (
                    <>
                        {getIcon && (
                            <img
                                src={selectedOption.imageURL}
                                alt=""
                                className="dropdown-icon"
                            />
                        )}
                        {selectedOption.text}
                    </>
                ) : (
                    'Select '+ name
                )}
                <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
            </div>
            {isOpen && (
                <div className="dropdown-list">
                    {options.map((option, index) => (
                        <div key={index} className="dropdown-option" onClick={() => handleOptionClick(option)}>
                            {getIcon && (
                                <img
                                    src={option.imageURL}
                                    alt=""
                                    className="dropdown-icon"
                                />
                            )}
                            {option.text}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Dropdown;