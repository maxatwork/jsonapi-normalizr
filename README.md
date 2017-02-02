# Schema-based JSON API data parser

Quick and dirty implementation. Do not use in production!

## Usage

### Imports

```javascript
import {schema, fields, normalize} from 'jsonapi-normalizr'
```

### Schemas

```javascript
const userSchema = schema('users', {
    email: fields.string(),
    fullName: fields.string({fromName: 'full_name'})
})

const commentSchema = schema('comments', {
    author: fields.relationship(userSchema),
    text: fields.string()
}, {jsonApiType: 'blog_comments'})

const postSchema = schema('posts', {
    title: fields.string(),
    text: fields.string(),
    comments: fields.relationship(commentSchema, {many: true})
}, {jsonApiType: 'blog_posts'})
```

### Source data

```javascript
const jsonApiData = {
    data: {
        id: '1',
        type: 'blog_posts',
        attributes: {
            title: 'Hello world!',
            text: 'This is the post about jsonapi-normalizr'
        },
        relationships: {
            comments: {
                data: [
                    {type: 'blog_comments', id: '1'},
                    {type: 'blog_comments', id: '2'}
                ]
            }
        }
    },
    included: [
        {
            id: '1',
            type: 'blog_comments',
            attributes: {text: 'First comment'},
            relationships: {
                author: {data: {type: 'users', id: '1'}}
            }
        },
        {
            id: '2',
            type: 'blog_comments',
            attributes: {text: 'Second comment'},
            relationships: {
                author: {data: {type: 'users', id: '2'}}
            }
        }
    ]
}
```

### Parsing

```javascript
const normalized = normalize(
    postSchema({include: ['comments']}),
    jsonApiData
)
```

### Result data

```json
{
    "result": {"type": "posts", "id": "1"},
    "entities": {
        "posts": {
            "1": {
                "id": 1,
                "title": "Hello world!",
                "text": "This is the post about jsonapi-normalizr",
                "comments": [
                    {"type": "comments", "id": 1},
                    {"type": "comments", "id": 2}
                ]
            }
        },
        "comments": {
            "1": {
                "id": 1,
                "author": {"type": "users", "id": 1},
                "text": "First comment"
            },
            "2": {
                "id": 2,
                "author": {"type": "users", "id": 2},
                "text": "Second comment"
            }
        }
    }
}
```
