const suppressedWarnings = [
    "Warning: XAxis: Support for defaultProps will be removed from function components in a future major release.",
    "Warning: YAxis: Support for defaultProps will be removed from function components in a future major release."
  ];
  
  const consoleError = console.error;
  console.error = (message, ...args) => {
    if (!suppressedWarnings.some(warning => message.includes(warning))) {
      consoleError(message, ...args);
    }
  };

  import './suppressWarnings';