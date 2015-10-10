make test:
	echo 'TODO'

make lint:
	pylint --msg-template='{C}: {msg} {path} ({line}|{column})' --output-format=colorized --rcfile=./pylint_rc src/**/*.py src/**/**/*.py
