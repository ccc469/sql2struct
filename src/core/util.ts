export enum CamelType {Camel, UpperCamel}

// uppercase first character
export const titleUpperCase = (str: string): string => {
  return str.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase())
}

// uppercase first character
export const titleLowerCase = (str: string): string => {
  return str.toLowerCase().replace(/(?!^)_([a-z])/g, (matches) => matches[1].toUpperCase())
}

// underline case to camel case
export const camelCase = (str: string, type: CamelType): string => {
  const arr = str.toLowerCase().split('_')
  const camelArr: Array<string> = []

  for (let i = 0; i < arr.length; i++) {
    if (i === 0 && type === CamelType.Camel) {
      camelArr.push(titleLowerCase(arr[i]))
    } else {
      camelArr.push(titleUpperCase(arr[i]))
    }
  }
  return camelArr.join('')
}
