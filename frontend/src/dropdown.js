import React, { useState, useEffect} from 'react';
import './dropdown.css';

function Dropdown({name, options, onSelectValue, getIcon, initialOption, alternateOption}) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);

    useEffect(() => {
        setSelectedOption(null);
        onSelectValue(null);
        const initial = options.find(option => option.optID === initialOption);
        if(initial) {
            setSelectedOption(initial);
            onSelectValue(initial.value);
        } else {
            const alternate = options.find(option => option.optID === alternateOption);
            if(alternate) {
                setSelectedOption(alternate);
                onSelectValue(alternate.value);
            } else{
                setSelectedOption(null);
                onSelectValue(null);
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