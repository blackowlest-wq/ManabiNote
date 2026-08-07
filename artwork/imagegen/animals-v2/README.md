# Animals v2 image-generation sources

Generated on 2026-08-06 with the built-in image generation tool.

The supplied cat illustration was used as a style reference. Each animal was generated as a separate square raster image so that weak or incorrect species can be regenerated without rebuilding the whole atlas.

Shared visual direction:

- cute preschool picture-card illustration
- rounded forms and consistent dark-brown outline
- soft pastel, species-appropriate colors
- warm light peach background
- one centered full-body animal with generous padding
- no text, logo, watermark, props, or extra animals

Final row-major atlas order:

`ant`, `bear`, `bird`, `butterfly`, `cat`, `chick`, `cow`, `crab`, `deer`, `dog`, `dolphin`, `elephant`, `fish`, `fox`, `frog`, `giraffe`, `horse`, `koala`, `lion`, `monkey`, `octopus`, `owl`, `panda`, `polar-bear`, `rabbit`, `turtle`, `cicada`, `crocodile`, `pig`, `mouse`.

The app-facing atlas is composed from these sources by `scripts/compose-animal-atlas.py`. The legacy SVG atlas remains unchanged for comparison and rollback.
