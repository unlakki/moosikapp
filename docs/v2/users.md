## Пользователи

#### Получить информацию о пользователе
```
Route: /users/{username}
Method: GET
Headers: {
  Authorization: Bearer JWT
}
```

Параметры URI
```js
{
  username: [String, 'required'],
}
```

Ответ
```js
{
  message: 'Successfully retrieved user.',
  user: {
    uuid: String, // e.g. 00000000-0000-0000-0000-000000000000
    username: String,
    email: String,
    role: Number, // Role ID
    createdAt: Date, // e.g. 1970-01-01T00:00:00.000Z
  }
}
```

Возможные ошибки
```js
// Status Code: 404
{ message: 'No user found.' }
```