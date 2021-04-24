
class WebGlUtils {
  createProgram(gl, vertexShaderSrc, fragmentShaderSrc, useProgram) {
    const vertexShader = this.createShader(gl, gl.VERTEX_SHADER, vertexShaderSrc);
    const fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSrc);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
      const errorMessage = gl.getProgramInfoLog(program)
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);

      throw new Error(errorMessage);
    }

    if (useProgram) {
      gl.useProgram(program);
    }

    return program;
  }

  createVertexArray(gl, bind) {
    const vao = gl.createVertexArray();
    if (bind) {
      gl.bindVertexArray(vao);
    }

    return vao;
  }
  
  createBuffer(gl, program, bind, attributes) {
    const buffer = gl.createBuffer();
    if (bind) {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

      attributes.forEach(attr => {
        const positionAttributeLocation = gl.getAttribLocation(program, attr.name);
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(positionAttributeLocation, attr.length, attr.type, false, attr.stride || 0, attr.offset);
      });
    }
    
    return buffer;
  }
  
  createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
      return shader;
    }

    const errorMessage = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader);
    throw new Error(errorMessage);
  }

  setUniform4f(gl, program, name, f1, f2, f3, f4) {
    const resolutionUniformLocation = gl.getUniformLocation(program, name);
    gl.uniform4f(resolutionUniformLocation, f1, f2, f3, f4);
  }
}
