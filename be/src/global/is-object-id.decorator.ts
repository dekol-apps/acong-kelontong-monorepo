import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { Types } from 'mongoose';

export function IsObjectId(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isObjectId',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          if (!value) return false;
          // Valid if it's already an ObjectId (e.g. converted by SanitizePipe)
          if (value instanceof Types.ObjectId) return true;
          // Valid if it's a valid hex string
          return typeof value === 'string' && Types.ObjectId.isValid(value) && String(new Types.ObjectId(value)) === value;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid MongoDB ObjectId`;
        }
      },
    });
  };
}
