#!/usr/bin/python
# (c) 2013 Manuel Braun (mb@w69b.com)
# Generates .js file from zxing blackbox test data that can be included in tests.

import glob
import os
import json

data_dir = 'test_data/blackbox'
outfile = 'tests/blackbox.data.js'


def readfile(file):
    with open(file) as f:
        return f.read();


def get_test_items(suite_dir):
    test_items = []
    extensions = ['.png', '.gif', '.jpg']
    txt_files = glob.glob(suite_dir + '/*.txt')
    for txt in sorted(txt_files):
        basename = os.path.splitext(txt)[0]
        for ext in extensions:
            img = basename + ext
            if os.path.exists(img):
                expected = readfile(txt)
                item = {'image': img,
                        'expected': expected}
                test_items.append(item)
                continue
    return test_items


def generate():
    suites = glob.glob(data_dir + '/qrcode-*')
    suite_items = {}
    for suite in sorted(suites):
        name = os.path.basename(suite)
        suite_items[name] = get_test_items(suite)
    js_code = 'define({});'.format(
            json.dumps(suite_items, indent=4))
    with open(outfile, 'w') as f:
        f.write(js_code)

    print 'DONE. {} was updated'.format(outfile)


if __name__ == '__main__':
    generate()
