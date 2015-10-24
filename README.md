# ang-select
AngularJS Select Box with CSS customization and multi-select option. This directive basically replaces the select element in order to customize the options.

Just need AngularJS and some styling (CSS is super bare bones)

# usage
### controller
```javascript
scope.list = [{id:1, color:'Red'},{id:2, color:'Green'}];
```
### html
```html
<ang-select model="model" data="list" field="color" placeholder="Select an option..."></ang-select>
```


# plunkr

http://plnkr.co/edit/szssBApt01llTgVvooMC?p=info
