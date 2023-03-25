import { GoStruct, GoStructField, kv, SqlField, SqlTable } from './type'
import { camelCase, CamelType } from './util'

// get go struct field type from sql field type
export const getGoStructFieldType = (sqlFieldType: string, fieldMaps: kv): string | null => {
  const goStructFieldType = fieldMaps[sqlFieldType]
  if (!goStructFieldType) {
    return null
  }

  return goStructFieldType
}

// transfer sql table to go struct
export const toGoStruct = (
  sqlTable: SqlTable,
  tags: Array<string>,
  specialIdentifiers: Array<string>,
  fieldMaps: kv,
  caseStyle: number
): GoStruct | null => {
  const fields: Array<GoStructField> = []
  sqlTable.fields.forEach((sqlField: SqlField) => {
    const tagKv: kv = {}
    tags.forEach((tag) => {
      if (tag === 'gorm') {
        tagKv[tag] = `column:${sqlField.name}`
      } else {
        if (tag === 'json') {
          switch (caseStyle) {
            case 1:
              tagKv[tag] = camelCase(sqlField.name, CamelType.UpperCamel)
              break;
            case 2:
              tagKv[tag] = camelCase(sqlField.name, CamelType.Camel)
              break;
            default:
              tagKv[tag] = sqlField.name
              break;
          }
        } else {
          tagKv[tag] = camelCase(sqlField.name, CamelType.Camel)
        }
      }
    })
    const field: GoStructField = {
      name: specialIdentifiers.includes(sqlField.name) ? sqlField.name.toUpperCase() : camelCase(sqlField.name, CamelType.UpperCamel),
      type: getGoStructFieldType(sqlField.type, fieldMaps) as string,
      comment: sqlField.comment,
      tags: tagKv,
    }
    fields.push(field)
  })

  const struct: GoStruct = {
    name: camelCase(sqlTable.name, CamelType.UpperCamel),
    fields,
    comment: sqlTable.comment,
  }

  return struct
}

// format go struct object to string
export const formatGoStruct = (struct: GoStruct): string => {
  let content = `// ${struct.name} ${struct.comment}\ntype ${struct.name} struct {`

  struct.fields.forEach((item) => {
    content += `\n\t${item.name} ${item.type}`

    if (item.tags && Object.keys(item.tags).length > 0) {
      content += ` \``
      const tagArr: Array<string> = []
      Object.keys(item.tags).forEach((key) => {
        const value = item.tags ? item.tags[key] : ''
        tagArr.push(`${key}:"${value}"`)
      })
      content += `${tagArr.join(' ')}\``
    }

    if (item.comment) {
      content += ` // ${item.comment}`
    }
  })
  content += `
}`

  return content
}

// gen go struct code from sql table object
export const genGoStructCode = (
  sqlTable: SqlTable,
  tags: Array<string>,
  specialIdentifiers: Array<string>,
  fieldMaps: kv,
  caseStyle: number
): string | null => {
  const goSturct = toGoStruct(sqlTable, tags, specialIdentifiers, fieldMaps, caseStyle)
  if (!goSturct) {
    return null
  }

  let goStructCode = formatGoStruct(goSturct)
  if (!goStructCode) {
    return null
  }

  goStructCode += `\n\n// TableName 表名称\nfunc (*${goSturct.name}) TableName() string {
    return "${sqlTable.name}"        
}`
  return goStructCode
}
