# ang-select
AngularJS Select Box with CSS customization and multi-select option. This directive basically replaces the select element in order to customize the options.

Just need AngularJS and some styling (CSS is super bare bones)

# usage
### controller
```javascript
scope.list = [{id:1, color:'Red'},{id:2, color:'Green'}];
```
### html (basic)
```html
<ang-select model="model" data="list" field="color" placeholder="Select an option..."></ang-select>
```

### css
Here is the class structure
```html
<ang-select class="ang-select">
  <ang-select-display class="ang-select-display></ang-select-display>
  <ang-select-list class="ang-select-list">
     <ang-select-list-item class="ang-select-list-item"></ang-select-list-item>
  </ang-select-list>
</ang-select>
```
At the root node (ang-select), there will be three css elements that will get toggled:
 - 'active', 'disabled', 'error'
 
For multi-select, each option (ang-select-list-item element) will toggle the 'selected' class.

# plunkr

http://plnkr.co/edit/szssBApt01llTgVvooMC?p=info
