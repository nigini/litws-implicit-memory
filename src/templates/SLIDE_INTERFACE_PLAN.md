# Plan: Slide Interface Namespace (`LITW.slide`)

## Status: Tabled (not yet implemented)

## Problem
Templates (demographics, comments, future trial slides) define `getFormData()` / `getData()`
functions inside `<script>` blocks. The study-manager calls these from `finish` callbacks,
but the reference is implicit — just a global function name with no clear contract.

## Proposal
Introduce `LITW.slide` as a namespace where templates register their public interface.

### Scaffold (in study-manager.js)
```javascript
LITW.slide = LITW.slide || {};
```

### Template registration (e.g., demographics-plain.html)
```javascript
LITW.slide.demographics = {
    getData: function() { /* extract form data */ }
};
```

### Study-manager usage (in finish callbacks)
```javascript
finish: function(){
    let dem_data = LITW.slide.demographics.getData();
    LITW.data.addToLocal(this.template_data.local_data_id, dem_data);
    LITW.data.submitDemographics(dem_data);
}
```

## Possible future extensions per slide
- `getData()` — extract collected data (forms, trial responses)
- `validate()` — is the slide ready to proceed?
- `reset()` — clear to initial state
- `configure(settings)` — receive study-specific config
- `onShow()` / `onHide()` — lifecycle hooks

## Design rationale
- **Templates are shared, studies are specific.** The same template is used across studies.
  Each study may handle the data differently, so templates should not own submission logic.
- **Separation of concerns:** Template = "render UI + extract data".
  Study-manager = "orchestrate flow + decide what to do with data".
- `LITW.slide` complements `config.slides` (internal study config) —
  one is the runtime interface, the other is the study definition.

## When to implement
When building trial slides or when the number of templates with `getData()` grows
beyond demographics + comments. No need to over-engineer for two templates.
