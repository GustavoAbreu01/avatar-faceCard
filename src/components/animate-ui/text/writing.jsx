'use client';;
import * as React from 'react';
import { motion, useInView } from 'motion/react';

function WritingText({
  ref,
  inView = false,
  inViewMargin = '0px',
  inViewOnce = true,
  spacing = 5,
  text,
  transition = { type: 'spring', bounce: 0, duration: 2, delay: 0.5 },
  ...props
}) {
  const localRef = React.useRef(null);
  React.useImperativeHandle(ref, () => localRef.current);

  const inViewResult = useInView(localRef, {
    once: inViewOnce,
    margin: inViewMargin,
  });
  const isInView = !inView || inViewResult;

  const words = React.useMemo(() => text.split(' '), [text]);

  return (
    <span ref={localRef} data-slot="writing-text" {...props}>
      {words.map((word, index) => (
        <motion.span
          key={index}
          className="inline-block will-change-transform will-change-opacity"
          style={{ marginRight: spacing }}
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{
            ...transition,
            delay: index * (transition?.delay ?? 0),
          }}>
          {word}{' '}
        </motion.span>
      ))}
    </span>
  );
}

export { WritingText };
