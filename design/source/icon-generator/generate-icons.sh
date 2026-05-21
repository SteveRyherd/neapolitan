# Generate standard icons in multiple sizes
magick app-icon.png -resize 16x16 app-icon-16.png 
magick app-icon.png -resize 32x32 app-icon-32.png
magick app-icon.png -resize 48x48 app-icon-48.png
magick app-icon.png -resize 64x64 app-icon-64.png
magick app-icon.png -resize 128x128 app-icon-128.png

# Generate environment icons in multiple sizes
for env in development staging production; do
  magick $env.png -resize 16x16 $env-16.png
  magick $env.png -resize 32x32 $env-32.png
done

# Generate a generic "unmatched" icon
magick app-icon.png -resize 16x16 -modulate 100,0 unmatched-16.png
magick app-icon.png -resize 32x32 -modulate 100,0 unmatched-32.png