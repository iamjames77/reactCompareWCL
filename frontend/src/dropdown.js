import React, { useState, useEffect} from 'react';
import './dropdown.css';

function Dropdown({name, options, onSelectValue, getIcon, initialOption, setOtherOpen}) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);

    useEffect(() => {
        setSelectedOption(null);
        onSelectValue(null);
        if (initialOption) {
            const initial = options.find(option => option.text === initialOption);
            if(initial) {
                setSelectedOption(initial);
                onSelectValue(initial.value);
            }
        }
    }, [options]);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleOptionClick = (option) => {;
        onSelectValue(option.value);
        setSelectedOption(option);
        setIsOpen(false);
    };

    return (
        <div className="dropdown">
            <div className="dropdown-header" onClick={handleToggle}>
                {selectedOption ? (
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