import React, { useState, useEffect} from 'react';
import './dropdown.css';

function Dropdown({name, options, onSelectValue, getIcon, initialName, initialFight, initialType}) {
    const [value, setValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);

    useEffect(() => {
        if (initialFight) {
          const initialOption = options.find(option => JSON.parse(option.value).id === initialFight);
          setSelectedOption(initialOption);
          setValue(initialFight);
        }
        else if (initialName) {
            const initialOption = options.find(option => option.text === initialName);
            setSelectedOption(initialOption);
            setValue(initialOption.value);
        }
        else if (initialType) {
            const initialOption = options.find(option => JSON.parse(option.value) === initialType);
            console.log(initialOption);
            setSelectedOption(initialOption);
            setValue(initialOption.value);
        }
      });

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
                {selectedOption ? (
                    <>
                        {getIcon && (
                            <img
                                src={`https://assets.rpglogs.com/img/warcraft/bosses/${JSON.parse(selectedOption.value)[0].encounterID}-icon.jpg`}
                                alt={selectedOption.text}
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
                                    src={`https://assets.rpglogs.com/img/warcraft/bosses/${JSON.parse(option.value)[0].encounterID}-icon.jpg`}
                                    alt={option.text}
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