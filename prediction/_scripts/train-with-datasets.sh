#!/bin/bash

# train-with-datasets.sh <output-dir> - runs the dataset training on the given output directory
# Optimized for 16 available CPUs

OUTPUT_DIR="$1"

if [[ -d $OUTPUT_DIR ]]; then
    date
    echo "Using $OUTPUT_DIR as output directory ...\n"
else
    echo "$OUTPUT_DIR is not a directory!"
    exit 1
fi

node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_122_citybikewien-frobelgasse-1139-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_59_citybikewien-vivenotgasse-1073-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_95_citybikewien-gertrudplatz-1111-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_77_citybikewien-schmelzbrucke-1092-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_23_citybikewien-julius-tandler-platz-1034-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_127_citybikewien-hoher-markt-1144-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_33_citybikewien-schottenfeldgasse-1045-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_53_citybikewien-karmeliterplatz-1066-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_56_citybikewien-heinestrasse-1069-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_62_citybikewien-siebensternplatz-1076-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_76_citybikewien-schwendermarkt-1091-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_61_citybikewien-schonbrunn-haupteingang-1075-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_79_citybikewien-sensengasse-1094-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_43_citybikewien-reinprechtsdorfer-brucke-1056-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_13_citybikewien-stadtpark-stubenring-1024-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
wait
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_92_citybikewien-mittersteig-1108-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_116_citybikewien-brestelgasse-1132-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_89_citybikewien-kundmanngasse-1105-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_31_citybikewien-urban-loritz-platz-1043-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_11_citybikewien-sigmund-freud-park-1022-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_93_citybikewien-arbeiterkammer-1109-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_72_citybikewien-millennium-tower-1087-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_106_citybikewien-markgraf-rudiger-strasse-1122-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_52_citybikewien-nepomukgasse-1065-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_18_citybikewien-johannesgasse-1029-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_128_citybikewien-hernals-s45-1146-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_46_citybikewien-wassergasse-1059-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_103_citybikewien-althanstrasse-1119-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_22_citybikewien-julius-raab-platz-1033-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_78_citybikewien-friedrich-engels-platz-1093-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
wait
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_26_citybikewien-boltzmanngasse-1037-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_25_citybikewien-frankhplatz-1036-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_98_citybikewien-ottakring-u3-1114-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_123_citybikewien-albertgasse-1140-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_50_citybikewien-webgasse-1063-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_71_citybikewien-praterstern-1086-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_32_citybikewien-burggasse-u6-1044-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_38_citybikewien-alser-strassefeldgasse-1051-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_91_citybikewien-siebenbrunnenplatz-1107-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_36_citybikewien-spittelau-u4u6-1049-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_115_citybikewien-aumannplatz-1131-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_17_citybikewien-karntner-ring-1028-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_125_citybikewien-radingerstrasse-1142-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_86_citybikewien-technisches-museum-1102-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_39_citybikewien-margaretengurtel-u4-1052-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
wait
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_101_citybikewien-blumengasse-1117-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_111_citybikewien-petrusgasse-1127-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_85_citybikewien-dornerplatz-1101-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_12_citybikewien-schwedenplatz-1023-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_19_citybikewien-singerstrasse-1030-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_80_citybikewien-meiselmarkt-1095-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_48_citybikewien-weghuberpark-1061-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_65_citybikewien-elterleinplatz-1079-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_44_citybikewien-nussdorfer-strasse-u6-1057-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_66_citybikewien-messeplatz-1080-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_10_citybikewien-wallnerstrasse-1021-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_113_citybikewien-westbahnhof-felberstrasse-1129-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_30_citybikewien-falco-stiege-1042-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_84_citybikewien-rosensteingasse-1100-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_87_citybikewien-westbahnhof-europaplatz-1103-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
wait
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_110_citybikewien-schweglerstrasse-1126-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_82_citybikewien-michelbeuern-1097-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_105_citybikewien-selzergasse-1121-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_83_citybikewien-gumpendorfer-gurtel-1098-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_109_citybikewien-sankt-elisabeth-platz-1125-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_97_citybikewien-matzleinsdorfer-platz-1113-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_81_citybikewien-turnergasse-1096-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_47_citybikewien-fasanplatz-1060-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_20_citybikewien-schwarzenbergplatz-1031-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_120_citybikewien-yppenplatz-1137-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_40_citybikewien-radetzkyplatz-1053-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_15_citybikewien-friedrich-schmidtplatz-1026-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_24_citybikewien-rossauer-lande-u4-1035-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_68_citybikewien-stadion-center-1082-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_27_citybikewien-alser-strasse-u6-1038-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
wait
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_35_citybikewien-wahringer-strasse-u6-1048-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_60_citybikewien-schonbrunner-brucke-1074-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_118_citybikewien-universitatsring-1134-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_114_citybikewien-wieningerplatz-1130-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_94_citybikewien-schuhmeierplatz-1110-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_88_citybikewien-mayerhofgasse-1104-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_34_citybikewien-wallensteinplatz-1046-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_75_citybikewien-hofferplatz-1090-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_49_citybikewien-salmgasse-1062-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_102_citybikewien-juchgasse-1118-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_51_citybikewien-hartmanngasse-1064-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_104_citybikewien-bauernfeldplatz-1120-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_126_citybikewien-hauptbahnhof-west-1143-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_37_citybikewien-arbeitergasse-1050-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_14_citybikewien-volksgarten-1025-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
wait
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_55_citybikewien-kollergerngasse-1068-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_119_citybikewien-berggasse-1136-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_112_citybikewien-wien-mitte-1128-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_28_citybikewien-josefstadter-strasse-u6-1039-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_67_citybikewien-krieau-1081-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_73_citybikewien-gymnasiumstrasse-1088-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_54_citybikewien-treitlstrasse-1067-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_64_citybikewien-novaragasse-1078-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_21_citybikewien-museumsplatz-1032-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_100_citybikewien-heumuhlgasse-1116-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_107_citybikewien-bahngasse-1123-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_41_citybikewien-jagerstrasse-u6-1054-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_121_citybikewien-sudportalstrasse-1138-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_58_citybikewien-reschgasse-1072-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_99_citybikewien-loblichgasse-1115-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
wait
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_108_citybikewien-hauptbahnhof-1124-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_42_citybikewien-oper-1055-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_96_citybikewien-thaliastrasse-u6-1112-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_57_citybikewien-langenfeldgasse-1071-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_16_citybikewien-rathausplatz-1027-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_29_citybikewien-pilgramgasse-u4-1041-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_9_citybikewien-schottenring-u4-1020-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_124_citybikewien-friedensbrucke-1141-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_63_citybikewien-obere-donaustrasse-1077-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_69_citybikewien-hellwagstrasse-1083-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_74_citybikewien-richard-wagner-platz-1089-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_70_citybikewien-traisengasse-1085-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_117_citybikewien-gersthof-1133-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_90_citybikewien-markthalle-alsergrund-1106-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
node src/index.js dataset https://storage.googleapis.com/smai-public-datasets/citybikewien/complete/service_2-station_45_citybikewien-palffygasse-1058-2019-05-07_2019-07-31.csv $OUTPUT_DIR &
wait
date
echo "Done."