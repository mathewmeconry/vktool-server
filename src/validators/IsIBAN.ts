import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from "class-validator";

@ValidatorConstraint({name: 'IsIBAN', async: false})
export default class IsIBAN implements ValidatorConstraintInterface {
    public validate(text: string, args: ValidationArguments) {
        return IBAN.isValid(text)
    }

    public defaultMessage(args: ValidationArguments) {
        return 'IBAN ($value) is not valid'
    }
}