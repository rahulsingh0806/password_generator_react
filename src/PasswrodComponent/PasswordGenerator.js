import React, { Component } from 'react';
import copyIcon from './copy-regular.svg';
import checkboxesData from '../data';
import CheckboxInput from './Checkbox';

class PasswordGenerator extends Component {
    constructor(props) {
        super(props);
        this.state = {
            password: '',
            passwordLength: 10,
            checkCount: 0,
            indicatorColor: '#ccc',
            uppercaseCheck: false,
            lowercaseCheck: false,
            numbersCheck: false,
            symbolsCheck: false,
            checkboxes: [],
        };
        this.symbols = '~`!@#$%^&*()-_+={[}]|;:"<,>.?/';
    }

    componentDidMount() {
        this.handleSlider();
    }

    handleSlider = () => {
        const { passwordLength } = this.state;
        const inputSlider = document.querySelector("[data-lengthSlider]");
        inputSlider.value = passwordLength;
        this.setState({ passwordLength });

        const min = inputSlider.min;
        const max = inputSlider.max;

        inputSlider.style.backgroundSize = `${(((passwordLength - min) * 100) / (max - min)).toFixed(2)}% 100%`;
    };

    setIndicator = (color) => {
        const indicator = document.querySelector("[data-indicator]");
        indicator.style.background = color;
        indicator.style.boxShadow = `0px 0px 12px 1px ${color}`;
    };

    getRandomInteger = (min, max) => {
        return Math.floor(Math.random() * (max - min)) + min;
    };

    generateRandomNumber = () => {
        return this.getRandomInteger(0, 9);
    };

    generateLowerCase = () => {
        return String.fromCharCode(this.getRandomInteger(97, 123));
    };

    generateUpperCase = () => {
        return String.fromCharCode(this.getRandomInteger(65, 91));
    };

    generateSymbol = () => {
        const randNum = this.getRandomInteger(0, this.symbols.length);
        return this.symbols.charAt(randNum);
    };

    shufflePassword = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array.join('');
    };

    calStrength = () => {
        const {
            uppercaseCheck,
            lowercaseCheck,
            numbersCheck,
            symbolsCheck,
            passwordLength,
        } = this.state;

        if (
            lowercaseCheck &&
            uppercaseCheck &&
            (numbersCheck || symbolsCheck) &&
            passwordLength >= 8
        ) {
            this.setIndicator('#0f0');
        } else if (
            (lowercaseCheck || uppercaseCheck) &&
            (numbersCheck && symbolsCheck) &&
            passwordLength >= 6
        ) {
            this.setIndicator('#ff0');
        } else {
            this.setIndicator('#f00');
        }
    };

    copyContent = async () => {
        const passwordDisplay = document.querySelector("[data-passwordDisplay]");
        const copyMsg = document.querySelector("[data-copyMsg]");

        try {
            await navigator.clipboard.writeText(passwordDisplay.value);
            copyMsg.innerText = 'copied';
        } catch (e) {
            copyMsg.innerText = 'failed';
        }

        copyMsg.classList.add('active');

        setTimeout(() => {
            copyMsg.classList.remove('active');
        }, 500);
    };

    handleCheckboxChange(id) {
        const allCheckBox = document.querySelectorAll("input[type=checkbox]");
        const checkedCount = Array.from(allCheckBox).filter(checkBox => checkBox.checked).length;
        const { passwordLength } = this.state;
        // const { checkCount } = this.state;
    
        this.setState(prevState => {
            // Toggle the checkbox state
            const updatedState = { ...prevState, [id + 'Check']: !prevState[id + 'Check'] };
    
            // Update the checkBoxCount state
            updatedState.checkCount = checkedCount;
    
            // Update passwordLength state if necessary
            if (passwordLength < checkedCount) {
                updatedState.passwordLength = checkedCount;
                updatedState.checkCount = checkedCount;
            }
    
            return updatedState;
        }, () => {
            this.handleSlider();
        });
    }
    


    generatePassword = () => {

        const { passwordLength } = this.state;

        this.handleCheckboxChange();

        let generatedPassword = '';
        const funcArr = [];

        if (this.state.uppercaseCheck) {
            funcArr.push(this.generateUpperCase);
        }
        if (this.state.lowercaseCheck) {
            funcArr.push(this.generateLowerCase);
        }
        if (this.state.numbersCheck) {
            funcArr.push(this.generateRandomNumber);
        }
        if (this.state.symbolsCheck) {
            funcArr.push(this.generateSymbol);
        }

        for (let i = 0; i < funcArr.length; i++) {
            generatedPassword += funcArr[i]();
        }

        for (let i = 0; i < passwordLength - funcArr.length; i++) {
            let randomIndex = this.getRandomInteger(0, funcArr.length - 1); // Adjust the range
            if (randomIndex < 0) {
                // Handle the case where funcArr is empty or something went wrong
                console.error('funcArr is empty or invalid.');
                break;
            }
            if (typeof funcArr[randomIndex] === 'function') {
                generatedPassword += funcArr[randomIndex]();
            } else {
                console.error('Invalid function at index:', randomIndex);
            }
        }
        

        generatedPassword = this.shufflePassword(Array.from(generatedPassword));  // Yates shuffle algorithm

        this.setState({ password: generatedPassword }, () => {
            this.calStrength();
        });
    }

    render() {
        return (
            <div className="container">
                <h2 className="container-heading">PASSWORD GENERATOR</h2>
                <div className="display-container">
                    <input
                        readOnly
                        placeholder="Password"
                        className="display"
                        data-passwordDisplay
                        value={this.state.password}
                    />
                    <button className="copyBtn" onClick={this.copyContent}>
                        <span className="tooltip" data-copyMsg></span>
                        <img src={copyIcon} alt="Copy" height="25" width="25" />
                    </button>
                </div>
                <div className="input-container">

                    <div className="length-container">
                        <p>Password Length</p>
                        <p data-lengthNumber>{this.state.passwordLength}</p>
                    </div>

                    <input type="range" min="1" max="20" className="slider" data-lengthSlider
                        onChange={(e) =>
                            this.setState({ passwordLength: e.target.value }, () =>
                                this.handleSlider()
                            )
                        }
                        value={this.state.passwordLength}
                    />

                    {checkboxesData.map((checkbox) => (
                        <CheckboxInput
                            key={checkbox.id}
                            id={checkbox.id}
                            label={checkbox.label}
                            checked={this.state[checkbox.stateKey]}
                            onChange={() => this.handleCheckboxChange(checkbox.id)}
                        />
                    ))}

                    <div className="strength-container">
                        <p>Strength</p>
                        <div
                            className="indicator"
                            data-indicator
                            style={{ background: this.state.indicatorColor }}
                        ></div>
                    </div>
                    <button className="generateButton" onClick={this.generatePassword}>
                        GENERATE PASSWORD
                    </button>
                </div>
            </div>
        );
    }
}

export default PasswordGenerator;
