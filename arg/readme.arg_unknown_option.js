try {
  require('arg')({});
} catch (err) {
  if (err.code === 'ARG_UNKNOWN_OPTION') {
    console.log(err.code);
  } else {
    throw err;
  }
}
