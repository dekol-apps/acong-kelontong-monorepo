import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';
import { isMaxTwoDecimalMoney } from 'src/utils/helper';

export function IsMoney(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isMoney',
      target: object.constructor,
      propertyName,
      options: {
        message: `${propertyName} must be a valid money value with maximum 2 decimal places`,
        ...validationOptions,
      },
      validator: {
        validate(value: unknown) {
          return isMaxTwoDecimalMoney(value as string | number | undefined);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must have maximum 2 decimal places`;
        },
      },
    });
  };
}
