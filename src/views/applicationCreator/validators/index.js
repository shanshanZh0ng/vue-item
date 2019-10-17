export const validCodeName = (rule, value, callback) => {
  let reg = /^[a-zA-Z0-9|_]*$/
  if (!reg.test(value)) {
    callback(new Error('只能由数字、字母、下划线组成'))
  } else {
    callback()
  }
}

export const password = (rule, value, callback) => {
  let reg = /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[0-9]).{8,16}$/
  if (!reg.test(value)) {
    callback(new Error('8-16位，必须同时包含大小写英文字母和数字'))
  } else {
    callback()
  }
}

export const name = (rule, value, callback) => {
  let reg = /^[a-zA-Z0-9|_]{1,64}$/
  if (!reg.test(value)) {
    callback(new Error('名称为1-64个字符，只能包含数字、英文字符，或 “_”'))
  } else {
    callback()
  }
}

export const validCodeMount = (rule, value, callback) => {
  let reg = /^\/\S*$/
  if (!reg.test(value)) {
    callback(new Error('必须以"/"开头，不能包含空格'))
  } else {
    callback()
  }
}
