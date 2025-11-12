import { Fragment, useState, useEffect } from "react";
import { Card, CardContent } from "@mui/material";
import PageTitle from "../../components/PageTitle";
import { Trophy } from "lucide-react";
import TournamentForm from "./TournamentForm";
import { GetTournament, SaveTournament } from "../../services/tournament.service";
import {useParams} from "react-router-dom";
import ProgressBar from "../../components/ProgressBar";
import { useToast } from "../../utils/toast";

function EditTournament() {
    const { successToast, errorToast } = useToast();
    const [loader, setLoader] = useState(false);
    const [formLoader, setFormLoader] = useState(false);
    const { uuid } = useParams();
    const [record, setRecord] = useState({});

    useEffect(() => {
        setFormLoader(true);
        GetTournament(uuid).then((res) => {
            setRecord(res);
        }).finally(() => {
            setFormLoader(false);
        });
    }, [uuid]);

    const onSubmit = (data) => {
        setLoader(true);
        SaveTournament(data).then((res) => {
            if(res.status) {
                successToast('Updated successfully');
            } else {
                errorToast(res.errorMessage || 'Failed to save tournament');
            }
        }).finally(() => {
            setLoader(false);
        });
    }

    return (
        <Fragment>
            <PageTitle title="Edit Tournament" titleIcon={<Trophy />} />
            <Card>
                <ProgressBar formLoader={formLoader}/>
                <CardContent>
                    <TournamentForm record={record} formLoader={formLoader} loader={loader} callback={onSubmit}/>
                </CardContent>
            </Card>
        </Fragment>
    )
}

export default EditTournament

