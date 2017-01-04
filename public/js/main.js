/* Main code entrypoint.  This file should generally just call other JS modules and hook the elements up */
console.log('Document ready')

/* Note that this works because this script doesn't get loaded until the end of <body>.
   If you're writing something to be used by other people, which could go *anywhere* and does something immediately, (rather than just supplying a class etc.) then you'll need jQuery's ready() or an equivalent. */
