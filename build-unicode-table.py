#!/usr/bin/python
# (c) 2013 Manuel Braun (mb@w69b.com)

import os
import argparse


def get_mapping(infile):
    mapping = {}
    with open(infile) as fd:
        for line in fd.readlines():
            if not line.startswith('#'):
                items = line.split()
                incode = int(items[0], 16)
                outcode = int(items[1], 16)
                mapping[incode] = outcode

    return mapping


def convert(infile, outfile):
    print infile, outfile
    print get_mapping(infile)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
            description='Converts unicode mapping table to js')
    parser.add_argument('infile')
    parser.add_argument('outfile')
    args = parser.parse_args()
    convert(args.infile, args.outfile)

